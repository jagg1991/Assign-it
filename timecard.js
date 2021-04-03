
var originalTimeCardEntry = null;
var originalTimeCardEntryList = null;
var departmentList = null;
var jobList = null;
var customerList = null;
var projectList = null;
var taskList = null;

function deleteTimeCardEntry(timeCardEntryID) {
    $.ajax({
        url: "timecardsService.ashx?operation=deleteTimeCardEntry",
        //method: "POST",
        cache: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: { 'timeCardEntryID': timeCardEntryID },
        responseType: "json",
        success: function (result) {
            deleteTimeCardEntrySuccess(result);
        },
        error: function (result) {
            handleAjaxError(result, "failed to delete time card entry");
        }
    });
}

function deleteTimeCardEntrySuccess(result, punchLogID) {
    if (result.status == 'success') {
        location.assign('timecards.aspx');
        showTimeCardsMessage("Time Card Deleted");

    } else {
        alert('there was a problem deleting the punch, please reload the page and try again');
    }
}


function validateTimeCardEditor() {

    //clear all vals

    $('.timeCardEditorNotValid').removeClass('timeCardEditorNotValid');

    var validationMessages = [];
    var inpTimeCardDate = $('#inpTimeCardDate');
    var selectEmployee = $('#selectEmployee');

    if (isDate(inpTimeCardDate.val()) == false) {
        inpTimeCardDate.addClass('timeCardEditorNotValid');
        validationMessages.push('Please enter a time card date');
    }

    var timeCardID = $('#timeCardEditor').attr('data-timecardentryid');
    if (timeCardID == 0) {
        if (selectEmployee.val() == '') {
            selectEmployee.addClass('timeCardEditorNotValid');
            validationMessages.push('Please select and employee');
        }
    }

    // 11.26.2019 Adding functionality to validate units of work logs
    var divUnitsOfWorkLogs = $('#divUnitsOfWorkLogHolder .divUnitsOfWorkLogContainer');
    if (divUnitsOfWorkLogs && divUnitsOfWorkLogs.length > 0) {

        divUnitsOfWorkLogs.each(function () {

            var startCountInput = $(this).find('.inpUnitsOfWorkStartCount');
            var endCountInput = $(this).find('.inpUnitsOfWorkEndCount');
            var totalCountInput = $(this).find('.inpUnitsOfWorkTotalCount');
            var note = $(this).find('.inpUnitsOfWorkNote');

            var startCount = startCountInput.val().trim();
            var endCount = endCountInput.val().trim();
            var totalCount = totalCountInput.val().trim();

            if (startCount && !isNumeric(startCount)) {
                validationMessages.push("Start count must be numerical");
                startCountInput.addClass('is-invalid');
            } else {
                startCountInput.removeClass('is-invalid');
            }

            if (endCount && !isNumeric(endCount)) {
                validationMessages.push("End count must be numerical");
                endCountInput.addClass('is-invalid');
            } else {
                endCountInput.removeClass('is-invalid');
            }

            if (totalCount && !isNumeric(totalCount)) {
                validationMessages.push("Total count must be numerical");
                totalCountInput.addClass('is-invalid');
            } else {
                totalCountInput.removeClass('is-invalid');
            }

            if ((startCount && !endCount) || (startCount && !isNumeric(endCount))) {
                validationMessages.push('End count is required with a start count');
                endCountInput.addClass('is-invalid');
            } else {
                endCountInput.removeClass('is-invalid');
            }

            if ((!startCount && endCount) || (!isNumeric(startCount) && endCount)) {
                validationMessages.push('Start count is required with a end count');
                startCountInput.addClass('is-invalid');
            } else {
                startCountInput.removeClass('is-invalid');
            }

            if (startCount && endCount && totalCount) {
                if (endCount - startCount != totalCount) {
                    validationMessages.push('The difference between end and start must equal total');
                    totalCountInput.addClass('is-invalid');
                } else {
                    totalCountInput.removeClass('is-invalid');
                }
            }

            if (startCount && endCount && !totalCount) {
                if (isNumeric(startCount) && isNumeric(endCount)) {
                    totalCountInput.val(endCount - startCount);
                }
            }

            if (startCount && isNumeric(startCount) && endCount && isNumeric(endCount)) {
                if (+startCount > +endCount) {
                    validationMessages.push('End count must be greater than start count');
                    startCountInput.addClass('is-invalid');
                } else {
                    startCountInput.removeClass('is-invalid');
                }
            }

        });
    }


    $('#divPunchLogHolder .divPunchContainer').each(function () {
        //Fix mis entered values, validate required inputs and validate totals
        var divPunch = $(this).find('.divPunchLog');
        var divBreak = $(this).find('.divBreak');


        //get refs to ctrls
        inpPunchOverrideHours = divPunch.find("input[id^='inpPunchOverrideHours']");

        inpPunchInTime = divPunch.find("input[id^='inpPunchInTime']");
        inpPunchOutTime = divPunch.find("input[id^='inpPunchOutTime']");
        chkPunchOutNextDay = divPunch.find("input[id^='chkPunchOutNextDay']");

        var inpPunchOverrideHours = divPunch.find("input[id^='inpPunchOverrideHours']");
        var chkUseDuration = divPunch.find("input[id^='chkUseDuration']");

        if (chkUseDuration.is(":checked")) {
            //using duration

            //fix duration if hh:mm format, validate and try to convert to decimal hours


            // 5/22/2020
            if (!isValidHours(inpPunchOverrideHours.val())) {
                inpPunchOverrideHours.addClass('timeCardEditorNotValid');
                validationMessages.push('Please enter a time duration (e.g 5.5 or 5:30)');
            }

            //if (inpPunchOverrideHours.val().indexOf(":") !== -1) {
            //    //detected a hh:mm possibly, try to validate
            //    var decimalHours = convertHHMMToDecimalHours(inpPunchOverrideHours.val());

            //    if (isNumeric(decimalHours)) {
            //        inpPunchOverrideHours.val(decimalHours);
            //    } else {
            //        inpPunchOverrideHours.addClass('timeCardEditorNotValid');
            //        validationMessages.push('Please enter a valid time, e.g. 4:30');
            //    }
            //}

            //if (isNumeric(inpPunchOverrideHours.val()) == false) {
            //    inpPunchOverrideHours.addClass('timeCardEditorNotValid');
            //    validationMessages.push('Please enter a time duration');
            //}

        } else {
            //using in/out times

            //fix time formats
            inpPunchInTime.val(fixTimeFormat(inpPunchInTime.val()));
            inpPunchOutTime.val(fixTimeFormat(inpPunchOutTime.val()));

            //required in time
            if (inpPunchInTime.val().length == 0) {
                inpPunchInTime.addClass('timeCardEditorNotValid');
                validationMessages.push('Please enter a punch in time');
            }

            //validate times
            if (inpPunchInTime.val().length > 0 && isTime(inpPunchInTime.val()) == false) {
                inpPunchInTime.addClass('timeCardEditorNotValid');
                validationMessages.push('Please enter a valid punch in time');
            }

            if (inpPunchOutTime.val().length && isTime(inpPunchOutTime.val()) == false) {
                inpPunchOutTime.addClass('timeCardEditorNotValid');
                validationMessages.push('Please enter a valid punch out time');
            }

        }

        if (validationMessages.length == 0) {
            //only validate if in time and in/out formats are valid

            if (inpPunchInTime.val().length > 0 && inpPunchOutTime.val().length > 0) {
                var punchInTime = moment('1/1/1900 ' + inpPunchInTime.val());
                var punchOutTime = moment('1/1/1900 ' + inpPunchOutTime.val());
                var punchOutNextDay = chkPunchOutNextDay.is(':checked');

                if (punchOutTime.isBefore(punchInTime) && punchOutNextDay == false) {
                    inpPunchOutTime.addClass('timeCardEditorNotValid');
                    validationMessages.push('Punch out time must be after punch in time');
                }
            }
        }
    })

    //validate total hours
    //called by SAVE button, validate that totals add up
    var totalHours = $('#inpTCETotalHours').val();
    var rawRegularHours = $('#inpTCERegularHours').val();
    var rawOT1Hours = $('#inpTCEOvertime1Hours').val();
    var rawOT2Hours = $('#inpTCEOvertime2Hours').val();
    var rawOT3Hours = $('#inpTCEOvertime3Hours').val();
    var rawPersonalHours = $('#inpTCEPersonalHours').val();
    var rawHolidayHours = $('#inpTCEHolidayHours').val();
    var rawVacationHours = $('#inpTCEVacationHours').val();
    var rawSickHours = $('#inpTCESickHours').val();

    var temp = hoursDisplayFormat;

    var hoursFormatter = new HoursTimeUtility();
    //will set all vars to a ROUNDED(2 dec places) decimal number >= 0
    var decTotalHours = Number.parseFloat(hoursFormatter.format(totalHours.trim() || "0", "Decimal"));
    var decRegularHours = Number.parseFloat(hoursFormatter.format(rawRegularHours.trim() || "0", "Decimal"));
    var decOT1Hours = Number.parseFloat(hoursFormatter.format(rawOT1Hours.trim() || "0", "Decimal"));
    var decOT2Hours = Number.parseFloat(hoursFormatter.format(rawOT2Hours.trim() || "0", "Decimal"));
    var decOT3Hours = Number.parseFloat(hoursFormatter.format(rawOT3Hours.trim() || "0", "Decimal"));
    var decPersonalHours = Number.parseFloat(hoursFormatter.format(rawPersonalHours.trim() || "0", "Decimal"));
    var decHolidayHours = Number.parseFloat(hoursFormatter.format(rawHolidayHours.trim() || "0", "Decimal"));
    var decVacationHours = Number.parseFloat(hoursFormatter.format(rawVacationHours.trim() || "0", "Decimal"));
    var decSickHours = Number.parseFloat(hoursFormatter.format(rawSickHours.trim() || "0", "Decimal"));

    if (hoursDisplayFormat == 'Hours Minutes') {
        //un round hours if in HH:MM format so we can add and total hours accuratly to the minute
        decTotalHours = UnRoundDecimalHours(decTotalHours);
        decRegularHours = UnRoundDecimalHours(decRegularHours);
        decOT1Hours = UnRoundDecimalHours(decOT1Hours);
        decOT2Hours = UnRoundDecimalHours(decOT2Hours);
        decOT3Hours = UnRoundDecimalHours(decOT3Hours)
        decPersonalHours = UnRoundDecimalHours(decPersonalHours)
        decHolidayHours = UnRoundDecimalHours(decHolidayHours)
        decVacationHours = UnRoundDecimalHours(decVacationHours)
        decSickHours = UnRoundDecimalHours(decSickHours)
    }

    var totalHoursEntered = false;
    var workHoursEntered = false;
    var ptoHoursEntered = false;

    //set totalHoursEntered
    if (decTotalHours == 0) { totalHoursEntered = false; decTotalHours = 0; } else { totalHoursEntered = true; }


    //set workHoursEntered
    if (decRegularHours == 0 && decOT1Hours == 0 && decOT2Hours == 0 && decOT3Hours == 0) { workHoursEntered = false; } else { workHoursEntered = true; }

    //set ptoHoursEntered
    if (decPersonalHours == 0 && decHolidayHours == 0 && decVacationHours == 0 && decSickHours == 0) { ptoHoursEntred = false; } else { ptoHoursEntered = true; }


    var totalWorkHours = decRegularHours + decOT1Hours + decOT2Hours + decOT3Hours  //.0666666666666 
    var totalPTOHours = decPersonalHours + decHolidayHours + decVacationHours + decSickHours;  //.0166666666666
    var totalWorkAndPTOHours = decRegularHours + decOT1Hours + decOT2Hours + decOT3Hours + decPersonalHours + decHolidayHours + decVacationHours + decSickHours; //.08333333333
        
    //9/28/2020
    //round the totaled numbers, so .05 + .02 + .02 does NOT = 0.09000000000000001 (floating point math issue here)
    //totalWorkHours = Number(totalWorkHours.toFixed(2)); //.0666666666 rounds to .07
    //totalPTOHours = Number(totalPTOHours.toFixed(2));  //.01666666 rounds to .02
    //decTotalHours = Number(decTotalHours.toFixed(2)); // .0833333 rounds to .08

    if ($('#unpaidPTO').is(':checked') == false) {

        if (decTotalHours > 0 && (Number(totalWorkHours + totalPTOHours).toFixed(2)) == 0) {
            //usere entered only total hours
        } else if (Number(decTotalHours.toFixed(2)) != Number(totalWorkHours + totalPTOHours).toFixed(2)) {
            //total hours should = workHours + ptoHours
            validationMessages.push('Oops, the "Total Hours" do not add up');
        }
    } else {
        //unpaid PTO
        if (totalHoursEntered == true && workHoursEntered == false) {
            //user only entered tot hours, system will auto calc ot and reg
            //is valid
        } else if (decTotalHours != totalWorkHours) {
            //only check that work hours match total 
            validationMessages.push('Oops, the "Total Hours" do not add up');

        }
    }

    return validationMessages;
}


function validateTimeSheetEditor() {

    //clear all vals
    $('.timeCardEditorNotValid').removeClass('timeCardEditorNotValid');

    var validationMessages = [];

    var timeSheetEmployeeSelect = $('#timeSheetEmployeeSelect');
    var employeeID = $('#timeSheetEditor').attr('data-employeeid');

    if (employeeID == 0) {
        if (timeSheetEmployeeSelect.val() == '') {
            timeSheetEmployeeSelect.addClass('timeCardEditorNotValid');
            validationMessages.push('Please select and employee');
        }
    }

    return validationMessages;
}


function fixTimeFormat(time) {
    //lowercase and add missing space before am/pm

    time = time.toLowerCase();
    time = time.trim();

    if (time.indexOf('am') > 0) {
        var i = time.indexOf('am')
        var t = time.substring(0, i).trim();
        time = t + ' am';
    } else if (time.indexOf('pm') > 0) {
        var i = time.indexOf('pm')
        var t = time.substring(0, i).trim();
        time = t + ' pm';
    }

    return time;
}

function isDate(dateString) {
    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isValidHours(value) {
    if (!isNaN(value)) {
        return true;
    } else if (value.match(/^(0?[0-9]{1,})(:[0-5][0-9])$/)) {
        return true
    }

    return false;
}

function isTime(time) {
    if (timeDisplayFormat && timeDisplayFormat.trim().toLowerCase() === "24 hour") {
        var match = time.match(/^(0?[0-9]|[012][0-9])(:[0-5][0-9])$/);
        return !!match;
    } else {
        var match = time.match(/^(0?[1-9]|1[012])(:[0-5]\d) [APap][mM]$/);
        return !!match;
    }
}

function showTimeCardsMessage(txt) {
    clearTimeout(shceduleMessageTimer);
    $('#timecardsMessageText').html(txt);
    $('#timecardsMessageContainer').fadeTo(80, 1);

    shceduleMessageTimer = setTimeout(function () {
        $('#timecardsMessageContainer').fadeOut(200);
    }, 1500);

}

function deletePunchLog(timeCardEntryID, punchLogID) {
    $.ajax({
        url: "timecardsService.ashx?operation=deletePunchLog",
        //method: "POST",
        cache: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: { 'timeCardEntryID': timeCardEntryID },
        data: { 'punchLogID': punchLogID },
        responseType: "json",
        success: function (result) {
            deletePunchLogSuccess(result);
        },
        error: function (result) {
            handleAjaxError(result, "failed to delete punch log");
        }
    });
}

function deletePunchLogSuccess(result, punchLogID) {
    if (result.status == 'success') {
        var id = result.punchID;
        $('[data-punchlogid="' + id + '"]').remove();
        punchOverrideIndication();
        //showTimeCardsMessage("Punch Deleted")


    } else {
        alert('there was a problem deleting the punch, please reload the page and try again');
    }
}

function getLists() {
    $.ajax({
        url: "timecardsService.ashx?operation=getLists",
        //method: "POST",
        cache: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        responseType: "json",
        success: function (result) {
            getListsSuccess(result);
        },
        error: function (result) {
            handleAjaxError(result, "failed to get data");
        }
    });
}


function getListsSuccess(result) {

    var employeeList = result.employeeList;
    departmentList = result.departmentList;
    jobList = result.jobList;
    customerList = result.customerList;
    projectList = result.projectList;
    taskList = result.taskList;


    var selectEmployee = $('#selectEmployee');
    var timeSheetEmployeeSelect = $('#timeSheetEmployeeSelect');


    selectEmployee.append($("<option></option>").attr("value", "").text("Select Employee"));
    timeSheetEmployeeSelect.append($("<option></option>").attr("value", "").text("Select Employee"));
    selectEmployee.change(function () {
        var showUow = $(this).children("option:selected").attr("data-is-uow-enabled") == 'true';
        if (showUow) {
            resetUnitsOfWork();
            $('#trUnitsOfWork').show();
            $('#unitsOfWorkContainer').show();
        } else {
            $('#trUnitsOfWork').hide();
            $('#unitsOfWorkContainer').hide();
        }
    });

    $.each(employeeList, function (key, emp) {
        selectEmployee.append($("<option></option>").attr("value", emp.id).attr("data-is-uow-enabled", emp.isUnitsOfWorkEnabled).text(emp.name));
        timeSheetEmployeeSelect.append($("<option></option>").attr("value", emp.id).text(emp.name));

    })

    $('#selectEmployee').find('option:eq(0)').addClass('optionPlaceholder');
    $('#selectEmployee').addClass('optionPlaceholder');

    $('#selectEmployee').change(function () {
        if ($(this).val() == '') {
            $(this).addClass('optionPlaceholder');

        } else {
            $(this).removeClass('optionPlaceholder');
        }
    });






}

function getTimeCardEntry(timeCardEntryID, nextAction, newBreakStartTime) {
    $.ajax({
        url: "timecardsService.ashx?operation=getTimeCardEntry",
        //method: "POST",
        cache: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: { 'timeCardEntryID': timeCardEntryID },
        responseType: "json",
        success: function (result) {
            if (nextAction == 'openDialog') {
                getTimeCardEntrySuccessOpenDialog(result);
            } else {
                getTimeCardEntrySuccessInsertBreak(result, newBreakStartTime);
            }
        },
        error: function (result) {
            handleAjaxError(result, "failed to get time card");
        }
    });
}

function getTimeCardEntrySuccessOpenDialog(envelope) {
    originalTimeCardEntry = envelope.timeCardEntry;
    openTimeEditorDialog(envelope.timeCardEntry);
}

function getTimeCardEntrySuccessInsertBreak(envelope, newBreakStartTime) {
    originalTimeCardEntry = envelope.timeCardEntry;
    originalTimeCardEntry.punchLog[0].punchLogID = -1
    originalTimeCardEntry.punchLog[0].inTime = newBreakStartTime
    addLog(originalTimeCardEntry, 0);
}




function handleDeleteUnitsOfWorkClick(event) {
    var unitsOfWorkID = event.data.id;

    if (unitsOfWorkID) {
        if (confirm('Are you sure you want to delete this log?') == true) {
            deleteUnitsOfWorkByID(unitsOfWorkID);
        }
    }
}

function deleteUnitsOfWorkByID(unitsOfWorkID) {
    $.ajax({
        url: "timecardsService.ashx?operation=deleteUnitsOfWork",
        //method: "POST",
        cache: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: { 'unitsOfWorkID': unitsOfWorkID },
        responseType: "json",
        success: function (result) {
            $('[data-unitsofworkid="' + unitsOfWorkID + '"]').remove();
        },
        error: function (result) {
            handleAjaxError(result, "failed to delete punch log");
        }
    });
}

function updateTimeCardEntry() {
    var hoursFormatter = new HoursTimeUtility();
    var hoursFormat = "Decimal";

    var timeCardEntryID = $('#timeCardEditor').attr('data-timecardentryid')
    var employeeID = $('#timeCardEditor').attr('data-employeeid')
    if (timeCardEntryID == 0) {
        employeeID = $('#selectEmployee').val();
    }
    var timeCardEntry = new Object();
    var timeCardEntryDate = $('#inpTimeCardDate').val();
    timeCardEntry.timeCardEntryID = timeCardEntryID
    timeCardEntry.employeeId = employeeID
    timeCardEntry.timeCardDate = timeCardEntryDate;

    // CHeck for > 0 else set ''    
    if ($('#inpTCETotalHours').val().trim() == '') {
        timeCardEntry.totalHours = '';
    } else {
        var decTotalHours = Number(hoursFormatter.format($('#inpTCETotalHours').val().trim() || "0", hoursFormat));
        timeCardEntry.totalHours = decTotalHours; // > 0 ? decTotalHours : '';        
    }

    if ($('#inpTCERegularHours').val().trim() == '') {
        timeCardEntry.regularHours = '';
    } else {
        var decRegularHours = Number(hoursFormatter.format($('#inpTCERegularHours').val().trim() || "0", hoursFormat));
        timeCardEntry.regularHours = decRegularHours;// > 0 ? decRegularHours : '';
    }

    if ($('#inpTCEOvertime1Hours').val().trim() == '') {
        timeCardEntry.overtime1Hours = '';
    } else {
        var decOvertime1Hours = Number(hoursFormatter.format($('#inpTCEOvertime1Hours').val().trim() || "0", hoursFormat));
        timeCardEntry.overtime1Hours = decOvertime1Hours;// > 0 ? decOvertime1Hours : '';
    }



    if ($('#inpTCEOvertime2Hours').val().trim() == '') {
        timeCardEntry.overtime2Hours = '';
    } else {
        var decOvertime2Hours = Number(hoursFormatter.format($('#inpTCEOvertime2Hours').val().trim() || "0", hoursFormat));
        timeCardEntry.overtime2Hours = decOvertime2Hours;// > 0 ? decOvertime2Hours : '';
    }


    if ($('#inpTCEOvertime3Hours').val().trim() == '') {
        timeCardEntry.overtime3Hours = '';
    } else {
        var decOvertime3Hours = Number(hoursFormatter.format($('#inpTCEOvertime3Hours').val().trim() || "0", hoursFormat));
        timeCardEntry.overtime3Hours = decOvertime3Hours;// > 0 ? decOvertime3Hours : '';
    }

    if ($('#inpTCEVacationHours').val().trim() == '') {
        timeCardEntry.vacationHours = '';
    } else {
        var decVacationHours = Number(hoursFormatter.format($('#inpTCEVacationHours').val().trim() || "0", hoursFormat));
        timeCardEntry.vacationHours = decVacationHours;// > 0 ? decVacationHours : '';
    }

    if ($('#inpTCEHolidayHours').val().trim() == '') {
        timeCardEntry.holidayHours = '';
    } else {
        var decHolidayHours = Number(hoursFormatter.format($('#inpTCEHolidayHours').val().trim() || "0", hoursFormat));
        timeCardEntry.holidayHours = decHolidayHours;// > 0 ? decHolidayHours : '';
    }

    if ($('#inpTCESickHours').val().trim() == '') {
        timeCardEntry.sickHours = '';
    } else {
        var decSickHours = Number(hoursFormatter.format($('#inpTCESickHours').val().trim() || "0", hoursFormat));
        timeCardEntry.sickHours = decSickHours;// > 0 ? decSickHours : '';
    }

    if ($('#inpTCEPersonalHours').val().trim() == '') {
        timeCardEntry.personalHours = '';
    } else {
        var decPersonalHours = Number(hoursFormatter.format($('#inpTCEPersonalHours').val().trim() || "0", hoursFormat));
        timeCardEntry.personalHours = decPersonalHours;// > 0 ? decPersonalHours : '';
    }

    timeCardEntry.note = $('#inpTCENote').val();

    timeCardEntry.tipAmount = $('#inpTCETipAmount').val();
    timeCardEntry.bonusAmount = $('#inpTCEBonusAmount').val();
    timeCardEntry.commissionAmount = $('#inpTCECommissionAmount').val();


    var log = [];

    $('#divPunchLogHolder .divPunchContainer').each(function () {

        var divPunch = $(this).find('.divPunchLog');
        var divBreak = $(this).find('.divBreak');
        var punchLog = new Object();

        punchLog.punchLogID = $(this).attr('data-punchlogid');

        var inpPunchOverrideHours = divPunch.find("input[id^='inpPunchOverrideHours']");
        var inpPunchInTime = divPunch.find("input[id^='inpPunchInTime']");
        var inpPunchOutTime = divPunch.find("input[id^='inpPunchOutTime']");

        var chkIsCheckIn = divPunch.find("input[id^='chkIsCheckIn']");
        var hoursFormatter = new HoursTimeUtility();
        var hoursFormat = "decimal"


        //fix times or duration
        var chkUseDuration = divPunch.find("input[id^='chkUseDuration']");

        if (chkUseDuration.is(":checked")) {
            //clear out times
            inpPunchInTime.val("");
            inpPunchOutTime.val("")
            var overrideHours = inpPunchOverrideHours.val();
            var hoursAsDecimal = hoursFormatter.format(overrideHours, hoursFormat);
            punchLog.punchOverrideHours = hoursAsDecimal;
        } else {
            //clear out duration
            inpPunchOverrideHours.val("")
            punchLog.punchOverrideHours = inpPunchOverrideHours.val();
        }




        punchLog.timeCardEntryID = $('#timeCardEditor').attr('data-timecardentryid')

        punchLog.inTime = inpPunchInTime.val();
        punchLog.outTime = inpPunchOutTime.val();
        punchLog.outNextDay = divPunch.find("input[id^='chkPunchOutNextDay']").is(':checked');
        punchLog.inIPAddress = ""
        punchLog.outIPAddress = ""
        punchLog.department = divPunch.find("input[id^='inpPunchDept']").val();

        punchLog.note = divPunch.find("textarea[id^='inpPunchNote']").val();

        punchLog.job = divPunch.find("input[id^='inpPunchJob']").val();
        punchLog.inLongitude = "1";
        punchLog.inLatitude = "2";
        punchLog.inAccuracy = "3";
        punchLog.outLongitude = "4";
        punchLog.outLatitude = "5";
        punchLog.outAccuracy = "6";

        punchLog.customerId = divPunch.find("input[id^='inpPunchCustomer']").attr('customerID');
        punchLog.projectId = divPunch.find("input[id^='inpPunchProject']").attr('projectID');
        punchLog.taskId = divPunch.find("input[id^='inpPunchTask']").attr('taskID');

        //punchLog.unPaidBreakHours = divPunch.find("input[id^='inpUnPaidBreakHours']").val();

        var paidBreakChecked = divBreak.find("input[id^='chkPaidBreak']").is(':checked');
        if (paidBreakChecked == true) {

            var breakHoursString = divBreak.find("input[id^='inpPaidBreakHours']").val().trim();

            var decimalBreakHours = Number(hoursFormatter.format(breakHoursString || "0", hoursFormat))
            punchLog.paidBreakHours = decimalBreakHours;

        } else {
            punchLog.paidBreakHours = ''
        }

        // 12.09.2019 add punchlog uow.
        var unitsOfWorkInput = divPunch.find('#inpUnitsOfWorkCount');
        var unitsOfWorkID = unitsOfWorkInput.attr('data-uowid');
        var unitsOfWorkCount = unitsOfWorkInput.val().trim();



        if (!unitsOfWorkCount || unitsOfWorkCount.length === 0) {
            unitsOfWorkCount = null;
        }

        punchLog.unitsOfWork = {
            unitsOfWorkID: unitsOfWorkID,
            totalCount: unitsOfWorkCount
        };

        punchLog.IsCheckIn = chkIsCheckIn.is(':checked');

        log.push(punchLog);
    })

    timeCardEntry.punchLog = log;

    // 11.27.2019 add units of work to timecardentry
    var unitsOfWorkLogs = [];

    $('#divUnitsOfWorkLogHolder .divUnitsOfWorkLogContainer').each(function () {
        var unitsOfWork = {};

        var unitsOfWorkID = $(this).find('#inpUnitsOfWorkID').val().trim();
        var startCount = $(this).find('#inpUnitsOfWorkStartCount').val().trim();
        var endCount = $(this).find('#inpUnitsOfWorkEndCount').val().trim();
        var totalCount = $(this).find('#inpUnitsOfWorkTotalCount').val().trim();
        var timeCardEntryID = $(this).find('#inpTimeCardEntryID').val().trim();
        var note = $(this).find('#inpUnitsOfWorkNote').val().trim();

        unitsOfWork.unitsOfWorkID = unitsOfWorkID;
        unitsOfWork.startCount = startCount;
        unitsOfWork.endCount = endCount;
        unitsOfWork.totalCount = Number(totalCount);
        unitsOfWork.timeCardEntryID = timeCardEntryID;
        unitsOfWork.note = note;

        unitsOfWorkLogs.push(unitsOfWork);
    })

    timeCardEntry.unitsOfWork = unitsOfWorkLogs;

    var envelope = new Object;
    envelope.timeCardEntry = timeCardEntry;
    envelope.originalTimeCardEntry = originalTimeCardEntry;

    $.ajax({
        url: "timecardsService.ashx?operation=updateTimeCardEntry",
        method: "POST",
        cache: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(envelope),
        responseType: "json",
        success: function (result) {
            updateTimeCardEntrySuccess(result);
        },
        error: function (result) {
            handleAjaxError(result, "failed to update the time card");
        }
    });
}

function updateTimeCardEntryList(timeCardEntryList) {

    var envelope = new Object;
    envelope.timeCardEntryList = timeCardEntryList;
    envelope.originalTimeCardEntryList = originalTimeCardEntryList;

    $.ajax({
        url: "timecardsService.ashx?operation=updateTimeCardEntryList",
        method: "POST",
        cache: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(envelope),
        responseType: "json",
        success: function (result) {
            $("#timeSheetEditor").dialog("close");

            if (result.status == 'success') {


                $('#timeCardWaitOverlay,#timeCardWaitMessage').fadeIn();
                saveScroll();

                location.assign('timecards.aspx');


                showTimeCardsMessage("Time Sheet Saved");
            } else {
                alert('there was a problem saving the sheet card, please reload the page and try again');
            }
        },
        error: function (result) {
            handleAjaxError(result, "failed to update the time sheet");
        }
    });
}




function updateTimeCardEntrySuccess(result) {
    $("#timeCardEditor").dialog("close");

    if (result.status == 'success') {

        //location.assign('timecards.aspx');
        //remmed 09.06.2016, because page was reloading twice, reload is handled by  "$("#timeCardEditor").on('dialogclose'" on timecards.aspx


        showTimeCardsMessage("Time Card Saved");
    } else {
        alert('there was a problem saving the time card, please reload the page and try again');
    }

}

function openTimeEditorDialog(timeCardEntry) {

    //$('#timeCardEditorPunchMap').hide();
    //$('#timeCardEditorAuditLog').hide();

    //$('#showAuditLog').text('show audit log >>>');
    //$('#showPunchMap').text('show punch map >>>');

    //clear all vals
    $('.timeCardEditorNotValid').removeClass('timeCardEditorNotValid');
    $('#timeCardMessage').hide();
    $('#timeCardEditor').attr('data-isdirty', "false");
    $('#timeCardEditor').attr('data-timecardentryid', timeCardEntry.timeCardEntryID)
    $('#timeCardEditor').attr('data-employeeid', timeCardEntry.employeeID)
    $('#spanTimeCardName').val(timeCardEntry.timeCardEntryID);
    $('#inpTimeCardDate').val(timeCardEntry.timeCardDate);


    var hoursFormatter = new HoursTimeUtility();

    if (timeCardEntry.totalHours) $('#inpTCETotalHours').val(hoursFormatter.format(timeCardEntry.totalHours, hoursDisplayFormat));
    else $('#inpTCETotalHours').val('');

    if (timeCardEntry.regularHours) $('#inpTCERegularHours').val(hoursFormatter.format(timeCardEntry.regularHours, hoursDisplayFormat));
    else $('#inpTCERegularHours').val('');

    if (timeCardEntry.overtime1Hours) $('#inpTCEOvertime1Hours').val(hoursFormatter.format(timeCardEntry.overtime1Hours, hoursDisplayFormat));
    else $('#inpTCEOvertime1Hours').val('');

    if (timeCardEntry.overtime2Hours) $('#inpTCEOvertime2Hours').val(hoursFormatter.format(timeCardEntry.overtime2Hours, hoursDisplayFormat));
    else $('#inpTCEOvertime2Hours').val('');

    if (timeCardEntry.overtime3Hours) $('#inpTCEOvertime3Hours').val(hoursFormatter.format(timeCardEntry.overtime3Hours, hoursDisplayFormat));
    else $('#inpTCEOvertime3Hours').val('');

    if (timeCardEntry.vacationHours) $('#inpTCEVacationHours').val(hoursFormatter.format(timeCardEntry.vacationHours, hoursDisplayFormat));
    else $('#inpTCEVacationHours').val('');

    if (timeCardEntry.holidayHours) $('#inpTCEHolidayHours').val(hoursFormatter.format(timeCardEntry.holidayHours, hoursDisplayFormat));
    else $('#inpTCEHolidayHours').val('');

    if (timeCardEntry.sickHours) $('#inpTCESickHours').val(hoursFormatter.format(timeCardEntry.sickHours, hoursDisplayFormat));
    else $('#inpTCESickHours').val('');

    if (timeCardEntry.personalHours) $('#inpTCEPersonalHours').val(hoursFormatter.format(timeCardEntry.personalHours, hoursDisplayFormat));
    else $('#inpTCEPersonalHours').val('');

    $('#inpTCENote').val(timeCardEntry.note);

    $('#inpTCETipAmount').val(timeCardEntry.tipAmount);
    $('#inpTCEBonusAmount').val(timeCardEntry.bonusAmount);
    $('#inpTCECommissionAmount').val(timeCardEntry.commissionAmount);

    if (timeCardEntry.isUnitsOfWorkEnabled) {
        $('#unitsOfWorkContainer').show();
        $('#trUnitsOfWork').show();
    } else {
        $('#unitsOfWorkContainer').hide();
        $('#trUnitsOfWork').hide();
    }

    var totalHoursEntered = false;
    var workHoursEntered = false;
    var ptoHoursEntered = false;

    if (timeCardEntry.totalHours == '') { totalHoursEntered = false; } else { totalHoursEntered = true; }
    if (timeCardEntry.regularHours == '' && timeCardEntry.overtime1Hours == '' && timeCardEntry.overtime2Hours == '' && timeCardEntry.overtime3Hours == '') { workHoursEntered = false; } else { workHoursEntered = true; }
    if (timeCardEntry.personalHours == '' && timeCardEntry.holidayHours == '' && timeCardEntry.vacationHours == '' && timeCardEntry.sickHours == '') { ptoHoursEntred = false; } else { ptoHoursEntered = true; }

    if (ptoHoursEntered == true && workHoursEntered == false && totalHoursEntered == false) {
        $('#unpaidPTO').prop('checked', true);
    } else {
        $('#unpaidPTO').prop('checked', false);
    }



    //remove all rows except proto        
    $("#divPunchLogHolder").html('');
    $("#divPunchContainerProtoType").hide() //divPunchContainerProtoType
    $("#divBreakProtoType").hide()

    //BEGIN ADD PUNCH LOGS
    for (var i = 0; i < timeCardEntry.punchLog.length; i++) {
        addLog(timeCardEntry, i)
   }

    if (timeCardEntry.punchLog.length == null) {
        $('#punchLogTitle').text('Click [add punch] for new punches');
        $('#showPunchMap').hide();

    } else {
        if (timeCardEntry.punchLog.length == 0) {
            $('#punchLogTitle').text('Click [add punch] for new punches')
            $('#showPunchMap').hide();
        }
        else if (timeCardEntry.punchLog.length == 1) {
            $('#punchLogTitle').text(timeCardEntry.punchLog.length + ' punch in/out')
            $('#showPunchMap').show();
        }
        else if (timeCardEntry.punchLog.length > 1) {
            $('#punchLogTitle').text(timeCardEntry.punchLog.length + ' punch in/outs (please scroll)...')
            $('#showPunchMap').show();
        }


    }

    // 11.27.2019 populate units of work log div.
    var uowHolder = $('#divUnitsOfWorkLogHolder');
    uowHolder.empty();

    if (timeCardEntry.isUnitsOfWorkEnabled) {
        for (var i = 0; i < timeCardEntry.unitsOfWork.length; i++) {

            var uowPrototype = $('#divUnitsOfWorkLogContainerProtoType').clone();
            uowPrototype.attr('id', 'divUnitsOfWorkLogContainerPrototype' + timeCardEntry.unitsOfWork[i].unitsOfWorkID);
            uowPrototype.attr('data-unitsofworkid', timeCardEntry.unitsOfWork[i].unitsOfWorkID);

            var title = uowPrototype.find('#unitsOfWorkNumber');
            title.text(title.attr('data-title'));

            uowPrototype.find('#unitsOfWorkTotal').empty().text(timeCardEntry.unitsOfWork[i].totalCount);


            var startCountInput = uowPrototype.find("#inpUnitsOfWorkStartCount");
            var endCountInput = uowPrototype.find("#inpUnitsOfWorkEndCount");
            var totalCountInput = uowPrototype.find("#inpUnitsOfWorkTotalCount");

            // Only allow decimals and numebrs
            startCountInput.keydown(function (e) { decimalOnlyHandler(e); });
            endCountInput.keydown(function (e) { decimalOnlyHandler(e); });
            totalCountInput.keydown(function (e) { decimalOnlyHandler(e); });


            uowPrototype.find('#inpUnitsOfWorkID').val(timeCardEntry.unitsOfWork[i].unitsOfWorkID);
            uowPrototype.find('#inpTimeCardEntryID').val(timeCardEntry.unitsOfWork[i].timeCardEntryID);

            startCountInput.val(timeCardEntry.unitsOfWork[i].startCount || '');
            endCountInput.val(timeCardEntry.unitsOfWork[i].endCount || '');
            totalCountInput.val(timeCardEntry.unitsOfWork[i].totalCount);

            uowPrototype.find('#inpUnitsOfWorkNote').val(timeCardEntry.unitsOfWork[i].note);

            var deleteUnitsOfWorkButton = uowPrototype.find('#deleteUnitsOfWorkLog');
            deleteUnitsOfWorkButton.click({ id: timeCardEntry.unitsOfWork[i].unitsOfWorkID }, handleDeleteUnitsOfWorkClick);

            uowPrototype.show()
            uowHolder.prepend(uowPrototype);
        }

        if (timeCardEntry.unitsOfWork.length > 0) {
            var title = $('#unitsOfWorkTitle')
            var rename = title.attr('data-title').toLowerCase();
            title.text(timeCardEntry.unitsOfWork.length + ' additional ' + rename + ' logs');
        } else {
            resetUnitsOfWork()
        }

    }

    // BEGIN Setup shift editor datepickers and time pickers
    $('.inpTCEDate').datepicker({
        dateFormat: 'm/d/yy'
    });

    var hours12 = ["6:00 am", "6:30 am", "7:00 am", "7:30 am", "8:00 am", "8:30 am", "9:00 am", "9:30 am", "10:00 am", "10:30 am", "11:00 am", "11:30 am", "12:00 pm", "12:30 pm", "1:00 pm", "1:30 pm", "2:00 pm", "2:30 pm", "3:00 pm", "3:30 pm", "4:00 pm", "4:30 pm", "5:00 pm", "5:30 pm", "6:00 pm", "6:30 pm", "7:00 pm", "7:30 pm", "8:00 pm", "8:30 pm", "9:00 pm", "9:30 pm", "10:00 pm", "10:30 pm", "11:00 pm", "11:30 pm", "12:00 am", "12:30 am", "1:00 am", "1:30 am", "2:00 am", "2:30 am", "3:00 am", "3:30 am", "4:00 am", "4:30 am", "5:00 am", "5:30 am"]
    var hours24 = ["06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00", "04:30", "05:00", "05:30"]

    $('.inpTCETime').autocomplete({
        minLength: 0,
        source: timeDisplayFormat.trim().toLowerCase() === '24 hour' ? hours24 : hours12,
        appendTo: $("#timeCardEditor").parent(),
        open: function () { $('#div .ui-menu').width(300) },
        close: function () { setPunchDuration($(this)); }
    });

    $('.inpTCETime').bind("click", function () { $(this).autocomplete("search", "") });

    $('.inpTCETime').change(function () {
        setPunchDuration($(this));
    });

    $('.inpTCETime').each(function () {
        setPunchDuration($(this));
    });

    $('input[id^="inpPunchOverrideHours"]').keyup(function () {
        setPunchDuration($(this));
    });



    // END Setup shift editor datepickers and time pickers

    if (timeCardEntry.timeCardEntryID == 0) {
        $('#selectEmployee').show();

    } else {
        $('#selectEmployee').hide();
    }


    //Audit Log
    var auditLogHtml = '';
    var timeFormat = timeDisplayFormat.trim().toLowerCase() === '24 hour' ? 'MM/DD/YYYY HH:mm' : 'MM/DD/YYYY hh:mm a';
    for (var i = 0; i < timeCardEntry.auditLog.length; i++) {

        var changeDateFormatted = moment(timeCardEntry.auditLog[i].changeDateTime).format(timeFormat)

        auditLogHtml += '<strong>'
        auditLogHtml += changeDateFormatted + ': ';
        auditLogHtml += timeCardEntry.auditLog[i].changeAction + ' by ';
        auditLogHtml += timeCardEntry.auditLog[i].changeByUser;
        auditLogHtml += '</strong><br>'
        auditLogHtml += timeCardEntry.auditLog[i].changeDescription + '<br>'
        auditLogHtml += 'Original values...' + '<br>'
        auditLogHtml += timeCardEntry.auditLog[i].originalValues;
        auditLogHtml += '<br>';
    }
    if (auditLogHtml.length == 0) {
        auditLogHtml = 'There are no audit logs for this time card.'
        $('#auditLogTitle').text('Audit Log (no changes)')
    }
    else {
        $('#auditLogTitle').text('Audit Log (' + timeCardEntry.auditLog.length.toString() + ' changes)')
    }

    $('#auditLog').html(auditLogHtml);
    //Audit Log


    if (timeCardEntry.timeCardEntryID == 0) {
        $('.timeCardEditorDialog .ui-dialog-title').text('Adding a day, please select date & employee');

    } else {
        $('.timeCardEditorDialog .ui-dialog-title').text('Adjusting day for ' + timeCardEntry.employeeName);
    }

    //$("#timeCardEditor").dialog({ 
    //    position: { my: "center", at: "center", of: window }
    //});

    $("#timeCardEditor").dialog('open');

    if ($('#timeCardEditorPunchMap').is(':visible')) {
        mapPunchLog();
    }

    $('.paidBreakHelp').tooltip();

    punchOverrideIndication();
}

function addLog(timeCardEntry, i) {

    var divNewPunchContainer = $("#divPunchContainerProtoType").clone();

    divNewPunchContainer.attr('id', 'divPunch' + i);
    divNewPunchContainer.attr('data-punchlogid', timeCardEntry.punchLog[i].punchLogID)

    var divNewPunch = divNewPunchContainer.find('.divPunchLog');

    //get refs to all ctrs and rename
    var punchNumber = divNewPunch.find('#punchNumber').attr('id', 'punchNumber' + (i));
    var punchHours = divNewPunch.find('#punchHours').attr('id', 'punchHours' + (i));

    var inpPunchOverrideHours = divNewPunch.find('#inpPunchOverrideHours').attr('id', 'inpPunchOverrideHours' + (i));

    var inpPunchInTime = divNewPunch.find('#inpPunchInTime').attr('id', 'inpPunchInTime' + (i));

    var chkIsCheckIn = divNewPunch.find('#chkIsCheckIn').attr('id', 'chkIsCheckIn' + (i));


    var spanPunchInIP = divNewPunch.find('#spanPunchInIP').attr('id', 'spanPunchInIP' + (i));
    var inpPunchOutTime = divNewPunch.find('#inpPunchOutTime').attr('id', 'inpPunchOutTime' + (i));
    var chkPunchOutNextDay = divNewPunch.find('#chkPunchOutNextDay').attr('id', 'chkPunchOutNextDay' + (i));
    var chkPunchOutNextDayLabel = divNewPunch.find('#chkPunchOutNextDayLabel').attr('id', 'chkPunchOutNextDayLabel' + (i));

    chkPunchOutNextDayLabel.attr('for', chkPunchOutNextDay.attr('id'));


    //var punchOutNextDayLabel = divNewPunch.find('#punchOutNextDayLabel').attr('id', 'punchOutNextDayLabel' + (i));
    var punchOutNextDayDate = divNewPunch.find('#punchOutNextDayDate').attr('id', 'punchOutNextDayDate' + (i));
    var spanPunchOutIP = divNewPunch.find('#spanPunchOutIP').attr('id', 'spanPunchOutIP' + (i));
    var inpPunchJob = divNewPunch.find('#inpPunchJob').attr('id', 'inpPunchJob' + (i));
    var inpPunchDept = divNewPunch.find('#inpPunchDept').attr('id', 'inpPunchDept' + (i));
    var inpPunchNote = divNewPunch.find('#inpPunchNote').attr('id', 'inpPunchNote' + (i));
    var deletePunch = divNewPunch.find('#deletePunch').attr('id', 'deletePunch' + (i));


    var inpPunchCustomer = divNewPunch.find('#inpPunchCustomer').attr('id', 'inpPunchCustomer' + (i));
    var inpPunchProject = divNewPunch.find('#inpPunchProject').attr('id', 'inpPunchProject' + (i));
    var inpPunchTask = divNewPunch.find('#inpPunchTask').attr('id', 'inpPunchTask' + (i));

    var spnPunchInPlatform = divNewPunch.find('#spnPunchInPlatform').attr('id', 'spnPunchInPlatform' + (i));
    var spnPunchOutPlatform = divNewPunch.find('#spnPunchOutPlatform').attr('id', 'spnPunchOutPlatform' + (i));


    var trPunchTimes = divNewPunch.find('#trPunchTimes').attr('id', 'trPunchTimes' + (i));
    var trPunchIPs = divNewPunch.find('#trPunchIPs').attr('id', 'trPunchIPs' + (i));
    var trPunchDuration = divNewPunch.find('#trPunchDuration').attr('id', 'trPunchDuration' + (i));
    var chkUseDuration = divNewPunch.find('#chkUseDuration').attr('id', 'chkUseDuration' + (i));
    var lblUseDuration = divNewPunch.find('#lblUseDuration').attr('id', 'lblUseDuration' + (i));
    var chkUseDurationLabel = divNewPunch.find('#chkUseDurationLabel').attr('id', 'chkUseDurationLabel' + (i));
    chkUseDurationLabel.attr('for', chkUseDuration.attr('id'));
    var divDurationGroup = divNewPunch.find('#divDurationGroup').attr('id', 'divDurationGroup' + (i));

    var punchOutNextDayToggleBox = divNewPunch.find('#punchOutNextDayToggleBox').attr('id', 'punchOutNextDayToggleBox' + (i));
    var punchOutNextDayToggleBoxLabel = divNewPunch.find('#punchOutNextDayToggleBoxLabel').attr('id', 'punchOutNextDayToggleBoxLabel' + (i));
    var punchOutTimeLabel = divNewPunch.find('#punchOutTimeLabel').attr('id', 'punchOutTimeLabel' + (i));





    var trJobDept = divNewPunch.find('#trJobDept').attr('id', 'trJobDept' + (i));
    var trCustomer = divNewPunch.find('#trCustomer').attr('id', 'trCustomer' + (i));
    var trProjectTask = divNewPunch.find('#trProjectTask').attr('id', 'trProjectTask' + (i));

    var divBreak = divNewPunchContainer.find('.divBreak').attr('id', 'divBreak' + (i));

    var addBreak = divNewPunch.find('#addBreak').attr('id', 'addBreak' + (i));

    if (timeCardEntry.punchLog[i].inPlatformAbbreviation != '') {
        spnPunchInPlatform.text(timeCardEntry.punchLog[i].inPlatformAbbreviation);
        spnPunchInPlatform.attr('title', timeCardEntry.punchLog[i].inPlatformDescription);

    } else {
        spnPunchInPlatform.hide();
    }

    if (timeCardEntry.punchLog[i].outPlatformAbbreviation != '') {
        spnPunchOutPlatform.text(timeCardEntry.punchLog[i].outPlatformAbbreviation);
        spnPunchOutPlatform.attr('title', timeCardEntry.punchLog[i].outPlatformDescription);
    } else {
        spnPunchOutPlatform.hide();
    }

    var hoursFormat = hoursDisplayFormat.trim().toLowerCase();
    var hoursFormatter = new HoursTimeUtility();

    if (hoursFormat === "decimal") {
        inpPunchOverrideHours.val(timeCardEntry.punchLog[i].punchOverrideHours);
    } else {
        if (timeCardEntry.punchLog[i].punchOverrideHours.trim().length > 0) {
            var formattedHours = hoursFormatter.format(timeCardEntry.punchLog[i].punchOverrideHours, hoursFormat);
            console.log("formated as ", formattedHours);
            inpPunchOverrideHours.val(formattedHours);
        }
    }

    var inTime = timeCardEntry.punchLog[i].inTime

    if (inTime && timeDisplayFormat.trim().toLowerCase() === '24 hour') {
        inTime = moment(timeCardEntry.punchLog[i].inTime, 'hh:mm aa').format('HH:mm');
    }

    inpPunchInTime.val(inTime);


    spanPunchInIP.text(timeCardEntry.punchLog[i].inIPAddress);

    var outTime = timeCardEntry.punchLog[i].outTime

    if (outTime && timeDisplayFormat.trim().toLowerCase() === '24 hour') {
        outTime = moment(timeCardEntry.punchLog[i].outTime, 'hh:mm aa').format('HH:mm');
    }
    inpPunchOutTime.val(outTime);
    spanPunchOutIP.text(timeCardEntry.punchLog[i].outIPAddress);

    if (timeCardEntry.punchLog[i].inIPAddress == '' && timeCardEntry.punchLog[i].outIPAddress == '') {
        trPunchIPs.hide();
    }

    var nextDay = new moment(timeCardEntry.timeCardDate).add(1, 'd').format('MM/D/YYYY');

    punchOutNextDayDate.text('(' + nextDay + ')');
    var id = punchOutNextDayDate.attr('id');


    if (inpPunchOverrideHours.val() != '') {
        trPunchTimes.hide();
        trPunchIPs.hide();
        chkUseDuration.prop('checked', true);
    } else {
        trPunchDuration.hide();
    }

    chkUseDuration.change({ punchIndex: i }, function (e) {
        if ($(this).is(':checked')) {
            $('#trPunchTimes' + e.data.punchIndex).hide();
            $('#trPunchIPs' + e.data.punchIndex).hide();
            $('#trPunchDuration' + e.data.punchIndex).show();
        } else {
            $('#trPunchTimes' + e.data.punchIndex).show();
            $('#trPunchIPs' + e.data.punchIndex).show();
            $('#trPunchDuration' + e.data.punchIndex).hide();
        }
    })

    chkPunchOutNextDay.change({ punchIndex: i }, function (e) {
        if ($(this).is(':checked')) {
            $('#punchOutNextDayDate' + e.data.punchIndex).show();
            //$('#punchOutNextDayLabel' + e.data.punchIndex).hide();
        } else {
            $('#punchOutNextDayDate' + e.data.punchIndex).hide();
            //$('#punchOutNextDayLabel' + e.data.punchIndex).show();
        }
    })

    chkPunchOutNextDay.tooltip();
    punchOutNextDayDate.tooltip();

    if (timeCardEntry.punchLog[i].outNextDay == true) {
        //check if punched hours are > 24, possibly a missed punch out
        var punchInDateTime = moment(moment(moment(timeCardEntry.timeCardDate).format('MM/D/YYYY') + ' ' + timeCardEntry.punchLog[i].inTime));
        var punchOutDateTime = moment(moment(moment(timeCardEntry.timeCardDate).add(1, 'd').format('MM/D/YYYY') + ' ' + timeCardEntry.punchLog[i].outTime));
        var hoursSpanned = punchOutDateTime.diff(punchInDateTime, 'h');
        if (hoursSpanned > 16) {
            punchOutNextDayDate.addClass('inpTCEWarning');
        }

        chkPunchOutNextDay.prop('checked', true)
        punchOutNextDayDate.show();
        //punchOutNextDayLabel.hide();
    } else {
        chkPunchOutNextDay.prop('checked', false)
    }

    deletePunch.click({ punchLogId: timeCardEntry.punchLog[i].punchLogID }, function (e) {
        if (window.confirm('Are you sure you want to delete this punch?') == true) {
            //alert("Delete DB saved punch ");
            deletePunchLog(0, e.data.punchLogId);
            $('#timeCardEditor').attr('data-isdirty', "true");
            //punchOverrideIndication();
        }
    });


    addBreak.click({ punchLogId: timeCardEntry.punchLog[i].punchLogID }, function (e) {
        $('#addBreakDialog').attr('data-punch-id', e.data.punchLogId);
        $('#addBreakDialog').dialog();

        //alert("addBreak Clicked. id=" + e.data.punchLogId)
        //if (window.confirm('Add Punch???') == true) {
        //    $('#timeCardEditor').attr('data-isdirty', "true");
        //}
    });

    //punchNumber.text('Punch #' + (i + 1).toString());


    if (timeCardEntry.punchLog[i].IsCheckIn == 'True') {
        //this is a check in, 
        chkIsCheckIn.prop('checked', true);
        inpPunchOutTime.val('');
        inpPunchOutTime.hide();
        punchNumber.text('Check In');
        punchHours.text('wewew');
        chkUseDuration.hide();
        lblUseDuration.hide();

        divDurationGroup.hide();
        punchHours.hide();

        punchOutNextDayToggleBox.hide();
        punchOutNextDayToggleBoxLabel.hide();
        chkPunchOutNextDayLabel.hide();
        punchOutTimeLabel.hide();
    } else {
        //this is a clock in or out or a duration, show durations
        chkIsCheckIn.prop('checked', false);


        punchNumber.text('Work');
        if (timeCardEntry.punchLog[i].punchHours != '') {
            var hoursFormatter = new HoursTimeUtility();
            var punchLogHours = timeCardEntry.punchLog[i].punchHours
            var hoursFormat = hoursDisplayFormat || 'Decimal';
            var hoursFormattedAmount = hoursFormatter.format(punchLogHours, hoursFormat);
            var hoursToDisplay = hoursFormat.toLowerCase() === 'decimal' ? hoursFormattedAmount + ' hours' : hoursFormattedAmount + ' (hh:mm)';
            punchHours.text(hoursToDisplay);
            //punchHours.text('(' + timeCardEntry.punchLog[i].punchHours + ' hours)');
        } else {
            punchHours.text('');
        }

    }





    inpPunchJob.val(timeCardEntry.punchLog[i].job);
    inpPunchDept.val(timeCardEntry.punchLog[i].department);


    inpPunchNote.val(timeCardEntry.punchLog[i].note);

    setTimeout(function (e) {
        resizeTextArea(e);
    }, 200, inpPunchNote[0])



    inpPunchNote.keypress(function () {
        resizeTextArea(this);
    });



    if (jobList.length > 0 || departmentList.length > 0 || timeCardEntry.punchLog[i].job != '' || timeCardEntry.punchLog[i].department != '') {
        trJobDept.show();
    } else {
        trJobDept.hide();
    }

    var activeCustomerList = $.grep(customerList, function (e) { return e.active == true && e.id != 0; });
    var activeProjectList = $.grep(projectList, function (e) { return e.active == true && e.id != 0; });
    var activeTaskList = $.grep(taskList, function (e) { return e.active == true && e.id != 0; });

    if (activeCustomerList.length > 0 || timeCardEntry.punchLog[i].customerID > 0) {
        trCustomer.show();
    } else {
        trCustomer.hide();
    }


    if (activeProjectList.length > 0 || activeTaskList.length > 0 || timeCardEntry.punchLog[i].projectID > 0 || timeCardEntry.punchLog[i].taskID > 0) {
        trProjectTask.show();
    } else {
        trProjectTask.hide();
    }


    inpPunchJob.autocomplete({
        minLength: 0,
        source: $.map(jobList, function (item) {
            return {
                label: item.name,
                value: item.name
            }
        }),
        appendTo: $("#timeCardEditor").parent(),
        open: function () { $('#div .ui-menu').width(300) }
    });
    inpPunchJob.bind("click", function () { $(this).autocomplete("search", "") });

    inpPunchDept.autocomplete({
        minLength: 0,
        source: $.map(departmentList, function (item) {
            return {
                label: item.name,
                value: item.name
            }
        }),
        appendTo: $("#timeCardEditor").parent(),
        open: function () { $('#div .ui-menu').width(300) }
    });
    inpPunchDept.bind("click", function () { $(this).autocomplete("search", "") });


    //fill ddl's
    inpPunchCustomer.autocomplete({
        minLength: 0,
        source: $.map(customerList, function (item) {
            if (item.active == true || item.id == timeCardEntry.punchLog[i].customerID) {
                return {
                    label: item.name,
                    value: item.name,
                    id: item.id
                }
            }
        }),
        appendTo: $("#timeCardEditor").parent(),
        open: function () { $('#div .ui-menu').width(300) },
        select: function (e, u) {
            $(this).attr('customerID', u.item.id);
            if (u.item.label == '< NONE >') {
                $(this).val('');
                return false;
            }
        }
    });

    inpPunchCustomer.bind("click", function () { $(this).autocomplete("search", ""); });
    if (timeCardEntry.punchLog[i].customerID > 0) {
        var cust = $.grep(customerList, function (e) { return e.id == timeCardEntry.punchLog[i].customerID; });
        if (cust.length == 1) {
            inpPunchCustomer.val(cust[0].name);
        }
    }
    inpPunchCustomer.attr('customerID', timeCardEntry.punchLog[i].customerID);

    //fill ddl's
    inpPunchProject.autocomplete({
        minLength: 0,
        source: $.map(projectList, function (item) {
            if (item.active == true || item.id == timeCardEntry.punchLog[i].projectID) {
                return {
                    label: item.name,
                    value: item.name,
                    id: item.id
                }
            }
        }),
        appendTo: $("#timeCardEditor").parent(),
        open: function () { $('#div .ui-menu').width(300) },
        select: function (e, u) {
            $(this).attr('projectID', u.item.id);
            if (u.item.label == '< NONE >') {
                $(this).val('');
                return false;
            }
        }
    });


    inpPunchProject.bind("click", function () { $(this).autocomplete("search", ""); });

    if (timeCardEntry.punchLog[i].projectID > 0) {
        var cust = $.grep(projectList, function (e) { return e.id == timeCardEntry.punchLog[i].projectID; });
        if (cust.length == 1) {
            inpPunchProject.val(cust[0].name);
        }
    }

    inpPunchProject.attr('projectID', timeCardEntry.punchLog[i].projectID);

    //fill ddl's
    inpPunchTask.autocomplete({
        minLength: 0,
        source: $.map(taskList, function (item) {
            if (item.active == true || item.id == timeCardEntry.punchLog[i].taskID) {
                return {
                    label: item.name,
                    value: item.name,
                    id: item.id
                }
            }
        }),
        appendTo: $("#timeCardEditor").parent(),
        open: function () { $('#div .ui-menu').width(300) },
        select: function (e, u) {
            $(this).attr('taskID', u.item.id);
            if (u.item.label == '< NONE >') {
                $(this).val('');
                return false;
            }
        }
    });

    inpPunchTask.bind("click", function () { $(this).autocomplete("search", ""); });
    if (timeCardEntry.punchLog[i].taskID > 0) {
        var cust = $.grep(taskList, function (e) { return e.id == timeCardEntry.punchLog[i].taskID; });
        if (cust.length == 1) {
            inpPunchTask.val(cust[0].name);
        }
    }

    inpPunchTask.attr('taskID', timeCardEntry.punchLog[i].taskID);


    //added 1/2017 break
    if (i + 1 < timeCardEntry.punchLog.length && timeCardEntry.punchLog[i].unPaidBreakHours != "") {

        //get refs to all ctrs and rename
        var inpPaidBreakHours = divBreak.find('#inpPaidBreakHours').attr('id', 'inpPaidBreakHours' + (i));
        var spanBreakHours = divBreak.find('#spanBreakHours').attr('id', 'spanBreakHours' + (i));
        //var spanUnPaidBreakHours = divBreak.find('#spanUnPaidBreakHours').attr('id', 'spanUnPaidBreakHours' + (i));
        var spanBreakStart = divBreak.find('#spanBreakStart').attr('id', 'spanBreakStart' + (i));
        var spanBreakEnd = divBreak.find('#spanBreakEnd').attr('id', 'spanBreakEnd' + (i));
        var chkPaidBreak = divBreak.find('#chkPaidBreak').attr('id', 'chkPaidBreak' + (i));

        var chkPaidBreakLabel = divBreak.find('#chkPaidBreakLabel').attr('id', 'chkPaidBreakLabel' + (i));
        chkPaidBreakLabel.attr('for', chkPaidBreak.attr('id'));

        var spanPaidBreakSection = divBreak.find('#spanPaidBreakSection').attr('id', 'spanPaidBreakSection' + (i));
        var spanBreakType = divBreak.find('#spanBreakType').attr('id', 'spanBreakType' + (i));


        if (timeCardEntry.punchLog[i].unPaidBreakHours == "") {
            //no break next
        } else {

            //spanBreakHours.html(timeCardEntry.punchLog[i].breakHours)
            
            var paidBreakHours = hoursFormatter.format(timeCardEntry.punchLog[i].paidBreakHours, hoursFormat)
            inpPaidBreakHours.val(paidBreakHours);
            //spanUnPaidBreakHours.html(timeCardEntry.punchLog[i].unPaidBreakHours);

            if (timeCardEntry.punchLog[i].paidBreakHours > 0) {
                chkPaidBreak.prop('checked', true);
                spanPaidBreakSection.show();
                spanBreakType.html('Paid Break, ');
            }
            else {
                chkPaidBreak.prop('checked', false);
                spanPaidBreakSection.hide();
                spanBreakType.html('Break, ');
            }
        }

        spanBreakStart.html(timeCardEntry.punchLog[i].outTime);
        spanBreakEnd.html(timeCardEntry.punchLog[i + 1].inTime);

        chkPaidBreak.change(function () {
            var spanbreakType = $(this).parent().parent().parent().find("[id^='spanBreakType']");

            if ($(this).is(':checked')) {
                $(this).parent().next().fadeIn();

                var inpPaidBreakHours = $(this).parent().next().find("[id^='inpPaidBreakHours']");

                //alert(inpPaidBreakHours.attr('id'));
                //alert(inpPaidBreakHours.val());

                var breakHours = $(this).parent().parent().parent().find("[id^='spanBreakHours']").html();

                //added 8/17/2020

                breakHours = breakHours.replace(" ","").replace("hours", "").replace("hh:mm", "")
                //added 8/17/2020

                //breakHours = '3';

                //alert(breakHours);
                //alert(breakHours);
                var temp = inpPaidBreakHours.val();

                if (inpPaidBreakHours.val() == '0' || inpPaidBreakHours.val() == '00:00' ) {
                    inpPaidBreakHours.val(breakHours);
                }
                spanbreakType.html('Paid Break, ');
            }
            else {
                $(this).parent().next().fadeOut();
                spanbreakType.html('Break, ');
            }
        })
        divBreak.show();
    }


    // added 1/2017

    // added 1.13.2020 enforce decimal only on units of work input value.
    var totalCountInput = divNewPunch.find("#inpUnitsOfWorkCount");
    totalCountInput.keydown(function (e) { decimalOnlyHandler(e); });

    divNewPunchContainer.appendTo("#divPunchLogHolder");
    divNewPunchContainer.show();

    // 12.09.2019 Populate units of work for this punch log if it exists
    var uow = timeCardEntry.punchLog[i].unitsOfWork;
    if (uow) {
        divNewPunchContainer.find('#inpUnitsOfWorkCount').val(uow.totalCount);
        divNewPunchContainer.find('#inpUnitsOfWorkCount').attr('data-uowid', uow.unitsOfWorkID);
    }

}

//END ADD PUNCH LOGS


function resetUnitsOfWork() {
    var title = $('#unitsOfWorkTitle')
    var rename = title.attr('data-title').toLowerCase();
    title.text('Click [add ' + rename + '] for new log');
}

function setPunchDuration(e) {

    var divPunch = e.closest('.divPunchLog');

    var chkUseDuration = divPunch.find('[id^="chkUseDuration"]');

    var hoursFormatter = new HoursTimeUtility();
    var hoursFormat = hoursDisplayFormat || 'Decimal';


    if (chkUseDuration.is(":checked")) {


        var punchHours = divPunch.find('[id^="punchHours"]');
        var inpPunchOverrideHours = divPunch.find('[id^="inpPunchOverrideHours"]');

        if (isNumeric(inpPunchOverrideHours.val())) {
            var hoursFormattedAmount = hoursFormatter.format(inpPunchOverrideHours.val().toString(), hoursFormat);
            var hoursToDisplay = hoursFormat.toLowerCase() === 'decimal' ? hoursFormattedAmount + ' hours' : hoursFormattedAmount + ' hh:mm';
            punchHours.html(hoursToDisplay);
        } else if (inpPunchOverrideHours.val().indexOf(':') != -1) {
            var hoursFormattedAmount = hoursFormatter.format(inpPunchOverrideHours.val().toString(), hoursFormat);
            var hoursToDisplay = hoursFormat.toLowerCase() === 'decimal' ? hoursFormattedAmount + ' hours' : hoursFormattedAmount + ' hh:mm';
            //var decimalHours = convertHHMMToDecimalHours(inpPunchOverrideHours.val());
            punchHours.html(hoursToDisplay);

        } else {
            punchHours.html("---");
        }


    } else {
        //calc for in/out times

        var punchInTime = divPunch.find('[id^="inpPunchInTime"]').val();
        var punchOutTime = divPunch.find('[id^="inpPunchOutTime"]').val();

        //var nextPunchInTime = divPunch.parent().next('.divPunchContainer').find('[id^="inpPunchInTime"]').val();
        //var prevPunchOutTime = divPunch.parent().prev('.divPunchContainer').find('[id^="inpPunchOutTime"]').val();

        var nextPunchContainer = divPunch.parent().next('.divPunchContainer');
        var prevPunchContainer = divPunch.parent().prev('.divPunchContainer');


        var a = moment('1/1/2000 ' + punchInTime);
        var b = moment('1/1/2000 ' + punchOutTime);
        var m = b.diff(a, 'minutes');
        var h = m / 60;
        decimalHours = Math.round(h * 100) / 100
        var punchHours = divPunch.find('[id^="punchHours"]');

        if (decimalHours >= 0) {
            var hoursFormattedAmount = hoursFormatter.format(decimalHours.toString(), hoursFormat);
            var hoursToDisplay = hoursFormat.toLowerCase() === 'decimal' ? hoursFormattedAmount + ' hours' : hoursFormattedAmount + ' hh:mm';
            punchHours.html(hoursToDisplay);
        } else {
            punchHours.html('');
        }

        //determine if user is adjusting in OR out time
        if (e.attr('id').substring(0, 14) == 'inpPunchInTime') {
            //adjusting in time, calc previous break duration
            if (prevPunchContainer.length > 0) {

                var prevPunchOutTime = prevPunchContainer.find('[id^="inpPunchOutTime"]').val();


                var a = moment('1/1/2000 ' + prevPunchOutTime);
                var b = moment('1/1/2000 ' + punchInTime);
                var m = b.diff(a, 'minutes');
                var h = m / 60;
                decimalHours = Math.round(h * 100) / 100

                var spanBreakHours = divPunch.parent().prev('.divPunchContainer').find('.divBreak').find('[id^="spanBreakHours"]');

                if (decimalHours >= 0) {
                    var hoursFormattedAmount = hoursFormatter.format(decimalHours.toString(), hoursFormat);
                    var hoursToDisplay = hoursFormat.toLowerCase() === 'decimal' ? hoursFormattedAmount + ' hours' : hoursFormattedAmount + ' hh:mm';
                    spanBreakHours.html(hoursToDisplay);
                } else {
                    spanBreakHours.html('');
                }

                //set break times
                prevPunchContainer.find('[id^="spanBreakStart"]').html(prevPunchOutTime);
                prevPunchContainer.find('[id^="spanBreakEnd"]').html(punchInTime);

            }


        } else {
            //adjusting out time, calc previous next duration
            if (nextPunchContainer.length > 0) {

                var nextPunchInTime = nextPunchContainer.find('[id^="inpPunchInTime"]').val();


                var a = moment('1/1/2000 ' + punchOutTime);
                var b = moment('1/1/2000 ' + nextPunchInTime);
                var m = b.diff(a, 'minutes');
                var h = m / 60;
                decimalHours = Math.round(h * 100) / 100

                var spanBreakHours = divPunch.parent().find('.divBreak').find('[id^="spanBreakHours"]');

                if (decimalHours >= 0) {
                    var hoursFormattedAmount = hoursFormatter.format(decimalHours.toString(), hoursFormat);
                    var hoursToDisplay = hoursFormat.toLowerCase() === 'decimal' ? hoursFormattedAmount + ' hours' : hoursFormattedAmount + ' hh:mm';
                    spanBreakHours.html(hoursToDisplay);
                } else {
                    spanBreakHours.html('');
                }

                //set break times
                divPunch.parent().find('.divBreak').find('[id^="spanBreakStart"]').html(punchOutTime);
                divPunch.parent().find('.divBreak').find('[id^="spanBreakEnd"]').html(nextPunchInTime);
            }


        }


    }








}

function handleAjaxError(result, userMessage) {
    if (result.responseText.indexOf('NoAuth') > -1 || result.responseText.indexOf('frmSignOn.aspx') > -1) {
        location.reload();
    } else {
        alert(userMessage)
    }
}

function addMarker() {

}

function geoDistance(lat1, lon1, lat2, lon2) {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var radlon1 = Math.PI * lon1 / 180
    var radlon2 = Math.PI * lon2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    return dist
}

function indexOfMarker(mapMarkers, latitude, longitude) {
    for (var i = 0; i < mapMarkers.length; i++) {

        var dist = geoDistance(mapMarkers[i].latitude, mapMarkers[i].longitude, latitude, longitude);
        if (dist < .2) {
            return i;
            break;
        }
    }
    return -1;
}

function mapyWidet(latitude, longitude, mapMarkers, accuracy, time, punchOperation, geoExceptions) {
    if ((latitude == parseFloat(latitude)) && (longitude == parseFloat(longitude))) {
        var markerIndex = indexOfMarker(mapMarkers, latitude, longitude);
        if (markerIndex >= 0) {
            //marker found, add to it
            mapMarkers[markerIndex].title = (mapMarkers[markerIndex].punchCount + 1).toString() + ' Punches...';
            mapMarkers[markerIndex].description += '\npunch ' + punchOperation + ' @ ' + time;
            mapMarkers[markerIndex].punchCount += 1;

        } else {
            //marker not found, add new marker
            var mapMarker = new Object;
            mapMarker.latitude = latitude;
            mapMarker.longitude = longitude;
            mapMarker.accuracy = accuracy;
            mapMarker.title = '1 Punch...';
            mapMarker.description = 'Punch ' + punchOperation + ' @ ' + time;
            mapMarker.punchCount = 1;
            mapMarkers.push(mapMarker);
        }
    } else if (parseFloat(latitude) == '700') {
        geoExceptions.push('punch ' + punchOperation + ' @ ' + time + ':  user did not share location');
    } else if (parseFloat(latitude) == '701') {
        geoExceptions.push('punch ' + punchOperation + ' @ ' + time + ':  could not detect location');
    } else if (parseFloat(latitude) == '702') {
        geoExceptions.push('punch ' + punchOperation + ' @ ' + time + ':  retrieving location timed out');
    } else if (parseFloat(latitude) == '703') {
        geoExceptions.push('punch ' + punchOperation + ' @ ' + time + ':  Unknown error detecting location');
    } else if (parseFloat(latitude) == '704') {
        geoExceptions.push('punch ' + punchOperation + ' @ ' + time + ':  geo location not supported by browser');
    }
}

function mapPunchLog() {

    var punchLog = originalTimeCardEntry.punchLog;
    var mapMarkers = [];
    var geoExceptions = [];

    for (var i = 0; i < punchLog.length; i++) {
        console.log(punchLog[i]);
        mapyWidet(punchLog[i].inLatitude, punchLog[i].inLongitude, mapMarkers, punchLog[i].inAccuracy, punchLog[i].inTime, 'in', geoExceptions)
        mapyWidet(punchLog[i].outLatitude, punchLog[i].outLongitude, mapMarkers, punchLog[i].outAccuracy, punchLog[i].outTime, 'out', geoExceptions)
    }  //end for loop


    $("#divTimeCardEditorPunchMap").show();
    $('#divTimeCardEditorPunchMapNoMarkers').hide();

    var map = new google.maps.Map(document.getElementById("divTimeCardEditorPunchMap"), {
        zoom: 1,
        styles: [
            {
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f3f3f3"
                    }
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#363636"
                    }
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#363636"
                    },
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#bdbdbd"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e5e5e5"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e6e6e6"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#dadada"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#616161"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e5e5e5"
                    }
                ]
            },
            {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                ]
            }
        ],
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    //END setup the map

    var mapBounds = new google.maps.LatLngBounds();

    for (i = 0; i < mapMarkers.length; i++) {

        var mapIcon = '';
        if (mapMarkers[i].punchCount <= 25) {
            mapIcon = 'AppImages/mapImages/icong' + mapMarkers[i].punchCount + '.png';
        }
        else {
            mapIcon = 'AppImages/mapImages/icong0.png';
        }

        marker = new google.maps.Marker({
            position: new google.maps.LatLng(mapMarkers[i].latitude, mapMarkers[i].longitude),
            title: mapMarkers[i].title + '\n' + mapMarkers[i].description,
            icon: mapIcon,
            animation: google.maps.Animation.DROP,
            map: map
        });

        marker.addListener('click', function () {
            var infoWindow = new google.maps.InfoWindow();
            var content = '<div style="font-size: .9em;">' + marker.title.replace(/\n/g, '</br>') + '</div>';
            infoWindow.setContent(content);
            infoWindow.open(map, marker);

        });

        mapBounds.extend(marker.getPosition());

    }  //end for loop


    if (mapMarkers.length == 0) {

        $("#divTimeCardEditorPunchMap").hide();
        $('#divTimeCardEditorPunchMapNoMarkers').show();
        //map.setCenter(new google.maps.LatLng(39.50, -98.35));
        //map.setZoom(4);
    }
    else if (mapMarkers.length == 1) {
        map.setCenter(mapBounds.getCenter());
        map.setZoom(14);
    }
    else {
        map.fitBounds(mapBounds);
    }

    if (geoExceptions.length > 0) {
        $('#geoExceptionList').html('');
        $('#geoExceptionsLabel').text(geoExceptions.length + ' Geo Exceptions');
        for (i = 0; i < geoExceptions.length; i++) {
            $('#geoExceptionList').append('<li>' + geoExceptions[i] + '</li>');
        }
    } else {
        $('#geoExceptions').hide();
    }

}

function dropMapPin(latitude, longitude, accuracy, title, map, mapBounds) {

    if ((latitude == parseFloat(latitude)) && (longitude == parseFloat(longitude))) {
        //long and lat are decimals, proced with adding marker

        var cont = title + '</br>';
        cont += latitude.toString() + ',' + longitude.toString() + '</br>';
        cont += "accuracy " + accuracy + " meters"

        var infoWindow = new google.maps.InfoWindow({
            content: cont
        });

        marker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            title: title,
            map: map
        });

        marker.addListener('click', function () {
            infoWindow.open(map, marker);
        });


        mapBounds.extend(marker.getPosition());

        return 1;

    } else {
        return 0;
    }
}

jQuery.fn.center = function () {
    this.css("position", "absolute");
    this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
    this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
    return this;
} //END jQuery.fn.center 

function punchOverrideIndication() {
    var punchCount = $('#divPunchLogHolder > div').length;

    //alert(punchCount);

    var totalHours = $('#inpTCETotalHours').val();
    var regularHours = $('#inpTCERegularHours').val();
    var otHours = $('#inpTCEOvertime1Hours').val();

    if (punchCount > 0 && (totalHours != '' || regularHours != '' || otHours != '')) {
        $('#divPunchLogHolder').addClass('punchsOverriddenMask')
        $('#punchsOverriddenMessage').show();

    } else {
        $('#divPunchLogHolder').removeClass('punchsOverriddenMask')
        $('#punchsOverriddenMessage').hide();
    }


}

//function autoCalcTotalHoursOLD() {
//    //called by keyup for all hours except total
//    var totalHours = $('#inpTCETotalHours').val();
//    var regularHours = $('#inpTCERegularHours').val();
//    var ot1Hours = $('#inpTCEOvertime1Hours').val();
//    var ot2Hours = $('#inpTCEOvertime2Hours').val();
//    var ot3Hours = $('#inpTCEOvertime3Hours').val();
//    var personalHours = $('#inpTCEPersonalHours').val();
//    var holidayHours = $('#inpTCEHolidayHours').val();
//    var vacationHours = $('#inpTCEVacationHours').val();
//    var sickHours = $('#inpTCESickHours').val();

//    var workHours = Number(Number(regularHours) + Number(ot1Hours) + Number(ot2Hours) + Number(ot3Hours));
//    var ptoHours = Number(Number(personalHours) + Number(holidayHours) + Number(vacationHours) + Number(sickHours));

//    var totalHoursEntered = false;
//    var workHoursEntered = false;
//    var ptoHoursEntered = false;
//    if (totalHours == '') { totalHoursEntered = false } else { totalHoursEntered = true; }
//    if (regularHours == '' && ot1Hours == '' && ot2Hours == '' && ot3Hours == '') { workHoursEntered = false; } else { workHoursEntered = true; }
//    if (personalHours == '' && holidayHours == '' && vacationHours == '' && sickHours == '') { ptoHoursEntred = false; } else { ptoHoursEntered = true; }

//    if ($('#unpaidPTO').is(':checked') == false) {
//        //normal auto calc
//        if (workHoursEntered == true || ptoHoursEntered == true) {
//            if (regularHours == '' && Number(ot1Hours) > 0) {
//                $('#inpTCERegularHours').val('0').animateThis(this);;
//            }
//            if (ot1Hours == '' && Number(regularHours) > 0) {
//                $('#inpTCEOvertime1Hours').val('0').animateThis(this);;
//            }
//            $('#inpTCETotalHours').val(Number(Number(workHours) + Number(ptoHours)).toFixed(2)).animateThis(this);
//        } else {
//            $('#inpTCETotalHours').val('').animateThis(this);;
//        }
//        punchOverrideIndication();
//    } else {
//        $('#inpTCETotalHours').val('').animateThis(this);
//        $('#inpTCERegularHours').val('').animateThis(this);
//        $('#inpTCEOvertime1Hours').val('').animateThis(this);
//        $('#inpTCEOvertime2Hours').val('').animateThis(this);
//        $('#inpTCEOvertime3Hours').val('').animateThis(this);
//    }

//    punchOverrideIndication();

//}


jQuery.fn.valMod = function (setVal) {

    if (this.is('input')) {
        if (setVal == null) {
            return this.val();
        } else {
            return this.val(setVal);
        }
    } else {
        if (setVal == null) {
            return this.text();
        } else {
            return this.text(setVal);
        }
    }

}

function autoCalcTotalHours(inpTCETotalHours, inpTCERegularHours, inpTCEOvertime1Hours, inpTCEOvertime2Hours, inpTCEOvertime3Hours, inpTCEPersonalHours, inpTCEHolidayHours, inpTCEVacationHours, inpTCESickHours, unpaidPTO) {
    //all inps are jQuery objects
    //called by keyup for all hours except total
    var totalHours = inpTCETotalHours.valMod();
    var regularHours = inpTCERegularHours.valMod();
    var ot1Hours = inpTCEOvertime1Hours.valMod();
    var ot2Hours = inpTCEOvertime2Hours.valMod();
    var ot3Hours = inpTCEOvertime3Hours.valMod();
    var personalHours = inpTCEPersonalHours.valMod();
    var holidayHours = inpTCEHolidayHours.valMod();
    var vacationHours = inpTCEVacationHours.valMod();
    var sickHours = inpTCESickHours.valMod();

    var hoursFormatter = new HoursTimeUtility();

    var decTotalHours = hoursFormatter.format(totalHours.trim(), "Decimal");
    var decRegularHours = hoursFormatter.format(regularHours.trim(), "Decimal");
    var decOt1Hours = hoursFormatter.format(ot1Hours.trim(), "Decimal");
    var decOt2Hours = hoursFormatter.format(ot2Hours.trim(), "Decimal");
    var decOt3Hours = hoursFormatter.format(ot3Hours.trim(), "Decimal");
    var decPersonalHours = hoursFormatter.format(personalHours.trim(), "Decimal");
    var decHolidayHours = hoursFormatter.format(holidayHours.trim(), "Decimal");
    var decVacationHours = hoursFormatter.format(vacationHours.trim(), "Decimal");
    var decSickHours = hoursFormatter.format(sickHours.trim(), "Decimal");

    //BEGIN when in HH:MM time format, unround all hour values so the total correctly
    var timeFormat = hoursDisplayFormat; // var declared in timecards.aspx page - from session state
    if (timeFormat.trim().toLowerCase() == 'hours minutes') {
        decTotalHours = UnRoundDecimalHours(decTotalHours);
        decRegularHours = UnRoundDecimalHours(decRegularHours);
        decOt1Hours = UnRoundDecimalHours(decOt1Hours);
        decOt2Hours = UnRoundDecimalHours(decOt2Hours);
        decOt3Hours = UnRoundDecimalHours(decOt3Hours);
        decPersonalHours = UnRoundDecimalHours(decPersonalHours);
        decHolidayHours = UnRoundDecimalHours(decHolidayHours);
        decVacationHours = UnRoundDecimalHours(decVacationHours);
        decSickHours = UnRoundDecimalHours(decSickHours);
    }
    //END


    //var workHours = Number(Number(regularHours) + Number(ot1Hours) + Number(ot2Hours) + Number(ot3Hours));
    //var ptoHours = Number(Number(personalHours) + Number(holidayHours) + Number(vacationHours) + Number(sickHours));
    var workHours = Number(Number(decRegularHours) + Number(decOt1Hours) + Number(decOt2Hours) + Number(decOt3Hours));
    var ptoHours = Number(Number(decPersonalHours) + Number(decHolidayHours) + Number(decVacationHours) + Number(decSickHours));

    //9/28/2020
    //round the totaled numbers, so .05 + .02 + .02 does NOW = 0.09000000000000001 (floating point math issue here)
    workHours = parseFloat(workHours.toFixed(2))
    ptoHours = parseFloat(ptoHours.toFixed(2))

    //


    //determine types of entered hours
    var totalHoursEntered = false;
    var workHoursEntered = false;
    var ptoHoursEntered = false;

    if (totalHours == '') { totalHoursEntered = false } else { totalHoursEntered = true; }
    if (regularHours == '' && ot1Hours == '' && ot2Hours == '' && ot3Hours == '') { workHoursEntered = false; } else { workHoursEntered = true; }
    if (personalHours == '' && holidayHours == '' && vacationHours == '' && sickHours == '') { ptoHoursEntred = false; } else { ptoHoursEntered = true; }
    //END determine types of entered hours


    if (unpaidPTO == null || unpaidPTO.is(':checked') == false) {
        //normal (not unpaid PTO) auto calc




        if (workHoursEntered == true || ptoHoursEntered == true) {

            if (workHoursEntered == true && ptoHoursEntered == false) {
                //user only entered work hours

                if (Number(decRegularHours) > 0 && ot1Hours == '') {
                    var ot1FormattedValue = hoursFormatter.format("0", hoursDisplayFormat);
                    inpTCEOvertime1Hours.valMod(ot1FormattedValue).animateThis(this);
                }


                if (regularHours == '' && Number(ot1Hours) > 0) {
                    var regFormattedValue = hoursFormatter.format("0", hoursDisplayFormat);
                    inpTCERegularHours.valMod(regFormattedValue).animateThis(this);
                }

            } else if (workHoursEntered == false && ptoHoursEntered == true) {
                //user only entered PTO hours
                //set reg hours and OT1 hours to 0
                var regFormattedValue = hoursFormatter.format("0", hoursDisplayFormat);
                var ot1FormattedValue = hoursFormatter.format("0", hoursDisplayFormat);
                inpTCERegularHours.valMod(regFormattedValue).animateThis(this);
                inpTCEOvertime1Hours.valMod(ot1FormattedValue).animateThis(this);
            }







            //update total hours
            var totalHoursFormattedValue = hoursFormatter.format((workHours + ptoHours).toString(), hoursDisplayFormat);
            inpTCETotalHours.valMod(totalHoursFormattedValue).animateThis(this);



        } else {
            inpTCETotalHours.valMod('').animateThis(this);;
        }

    } else {
        //unpaid PTO calc
        inpTCETotalHours.valMod('').animateThis(this);
        inpTCERegularHours.valMod('').animateThis(this);
        inpTCEOvertime1Hours.valMod('').animateThis(this);
        inpTCEOvertime2Hours.valMod('').animateThis(this);
        inpTCEOvertime3Hours.valMod('').animateThis(this);
    }

    punchOverrideIndication();

}

$.fn.animateThis = function () {

    if ($(this).val() != '' && $(this).is(':animated') == false) {
        $(this).animate({ backgroundColor: "#ffff00" }, 'slow').animate({ backgroundColor: "#fff" }, 'slow');
    }
}


function getTimeCardEntryList(employeeID, fromDate, thruDate, TimeCardColumns) {
    $.ajax({
        url: "timecardsService.ashx?operation=getTimeCardEntryList",
        //method: "POST",
        cache: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: { 'employeeID': employeeID, 'fromDate': fromDate, 'thruDate': thruDate },
        responseType: "json",
        success: function (result) {

            $('.timeSheetEditorNotValid').removeClass('timeCardEditorNotValid');
            $('#timeSheetMessage').hide();
            $('#timeSheetEmployeeSelect').hide();

            originalTimeCardEntryList = result.timeCardEntryList;
            var timeCardEntryList = result.timeCardEntryList;

            var daysInTimeCard = buildTimeSheetEditorGrid(fromDate, thruDate, timeCardEntryList, TimeCardColumns);

            var mIncDate = new moment(fromDate);
            var dayIndex = 0;
            var colIndex = 34

            while (dayIndex <= daysInTimeCard - 1) {
                var daysAdded = 0;
                for (timeCardIndex = 0; timeCardIndex < timeCardEntryList.length; timeCardIndex++) { //loop each time entry
                    var tempTimeCardDate = moment(timeCardEntryList[timeCardIndex].timeCardDate).format('MM/DD/YYYY');
                    var tempIncDate = mIncDate.format('MM/DD/YYYY');
                    if (moment(timeCardEntryList[timeCardIndex].timeCardDate).isSame(mIncDate, 'd')) {

                        // fill data
                        $('#timeSheetEditor').attr('data-employeeid', timeCardEntryList[timeCardIndex].employeeID);

                        $('#timeSheetEditorDataEntryHead td[data-dayindex="' + dayIndex + '"]').attr('data-timecardid', timeCardEntryList[timeCardIndex].timeCardEntryID);

                        var punchCount = Number(timeCardEntryList[timeCardIndex].punchLog.length);

                        if (punchCount > 0) {
                            $('#timeSheetEditorDataEntryPunches td span[data-dayindex="' + dayIndex + '"]').html(timeCardEntryList[timeCardIndex].punchLog.length);
                            if (timeCardEntryList[timeCardIndex].totalHours != '') {
                                $('#timeSheetEditorDataEntryPunches td span[data-dayindex="' + dayIndex + '"]+img').show();
                            }
                        }

                        $('#timeSheetEditorDataEntryTotalHours td span[data-dayindex="' + dayIndex + '"]').html(timeCardEntryList[timeCardIndex].totalHours);
                        $('#timeSheetEditorDataEntryRegularHours td span[data-dayindex="' + dayIndex + '"]').html(timeCardEntryList[timeCardIndex].regularHours);
                        $('#timeSheetEditorDataEntryOT1Hours td span[data-dayindex="' + dayIndex + '"]').html(timeCardEntryList[timeCardIndex].overtime1Hours);
                        $('#timeSheetEditorDataEntryOT2Hours td span[data-dayindex="' + dayIndex + '"]').html(timeCardEntryList[timeCardIndex].overtime2Hours);
                        $('#timeSheetEditorDataEntryOT3Hours td span[data-dayindex="' + dayIndex + '"]').html(timeCardEntryList[timeCardIndex].overtime3Hours);
                        $('#timeSheetEditorDataEntryVacationHours td span[data-dayindex="' + dayIndex + '"]').html(timeCardEntryList[timeCardIndex].vacationHours);
                        $('#timeSheetEditorDataEntryHolidayHours td span[data-dayindex="' + dayIndex + '"]').html(timeCardEntryList[timeCardIndex].holidayHours);
                        $('#timeSheetEditorDataEntrySickHours td span[data-dayindex="' + dayIndex + '"]').html(timeCardEntryList[timeCardIndex].sickHours);
                        $('#timeSheetEditorDataEntryPersonalHours td span[data-dayindex="' + dayIndex + '"]').html(timeCardEntryList[timeCardIndex].personalHours);

                        daysAdded += 1;
                        dayIndex += 1;

                    }
                }

                if (daysAdded == 0) {
                    // days not added from time card, inc the date
                    mIncDate.add(1, 'd');
                    dayIndex += 1;

                } else {
                    mIncDate.add(1, 'd');
                }
            }


            $('.timesheeteditorwrap .ui-dialog-title').text('Adjusting Multiple Days for ' + timeCardEntryList[0].employeeName);

            //bind change events. to show punch override indication
            $('#timeSheetEditorDataEntryTotalHours td span').keyup(function () {

                var dayIndex = $(this).attr('data-dayindex');

                var totalHours = $('#timeSheetEditorDataEntryTotalHours td span[data-dayindex="' + dayIndex + '"]').text();
                var punchCount = $('#timeSheetEditorDataEntryPunches td span[data-dayindex="' + dayIndex + '"]').text();


                $('#timeSheetEditorDataEntryPunches td span[data-dayindex="' + dayIndex + '"]+img').hide();
                if (punchCount > 0 && $.isNumeric(totalHours)) {
                    $('#timeSheetEditorDataEntryPunches td span[data-dayindex="' + dayIndex + '"]+img').show();
                }

            })

            $('#timeSheetEditorDataEntryPunches td img').tooltip({
                content: "Punches will be overridden due to hours being entered in the TOT box below."
            });

            $("#timeSheetEditor").dialog('open');

        },
        error: function (result) {
            handleAjaxError(result, "failed to get time card list");
        }
    });
}

function buildTimeSheetEditorGrid(fromDate, thruDate, timeCardEntryList, TimeCardColumns) {

    //TimeCardColumn Object Properties...
    //TimeCardColumns.TitleRegularHours
    //TimeCardColumns.TitleOT1
    //TimeCardColumns.TitleOT2
    //TimeCardColumns.TitleOT3
    //TimeCardColumns.TitleVacation
    //TimeCardColumns.TitleHoliday
    //TimeCardColumns.TitleSick
    //TimeCardColumns.TitlePersonal

    //clear out everything
    $('#timeSheetEditorDataEntryHead').html('<td></td>');
    $('#timeSheetEditorDataEntryPunches').html('<th scope="row">Punches</th>');
    $('#timeSheetEditorDataEntryTotalHours').html('<th scope="row" title="Total Hours">' + TimeCardColumns.TitleTotalHours + '</th>');
    $('#timeSheetEditorDataEntryRegularHours').html('<th scope="row" title="Regular Hours">' + TimeCardColumns.TitleRegularHours + '</th>');
    $('#timeSheetEditorDataEntryOT1Hours').html('<th scope="row" title="OT1 Hours">' + TimeCardColumns.TitleOT1 + '</th>');
    $('#timeSheetEditorDataEntryOT2Hours').html('<th scope="row" title="OT2 Hours">' + TimeCardColumns.TitleOT2 + '</th>');
    $('#timeSheetEditorDataEntryOT3Hours').html('<th scope="row" title="OT3 Hours">' + TimeCardColumns.TitleOT3 + '</th>');
    $('#timeSheetEditorDataEntryVacationHours').html('<th scope="row" title="Vacation Hours">' + TimeCardColumns.TitleVacation + '</th>');
    $('#timeSheetEditorDataEntryHolidayHours').html('<th scope="row" title="Holiday Hours">' + TimeCardColumns.TitleHoliday + '</th>');
    $('#timeSheetEditorDataEntrySickHours').html('<th scope="row" title="Sick Hours">' + TimeCardColumns.TitleSick + '</th>');
    $('#timeSheetEditorDataEntryPersonalHours').html('<th scope="row" title="Personal Hours">' + TimeCardColumns.TitlePersonal + '</th>');

    var mIncDate = new moment(fromDate);
    var mThruDate = new moment(thruDate);
    var mThruDateDayAfter = new moment(mThruDate.add(1, 'd'));
    var daysIndex = 0;

    for (monthDay = 1; monthDay <= 31; monthDay++) {

        addTimeSheetColumn(mIncDate, daysIndex)
        daysIndex += 1;
        var d = mIncDate.format('MM/DD/YYYY');

        if (timeCardEntryList != null) {
            var daysFound = 0;
            for (timeCardIndex = 0; timeCardIndex < timeCardEntryList.length; timeCardIndex++) {
                if (moment(timeCardEntryList[timeCardIndex].timeCardDate).isSame(mIncDate, 'd')) {
                    daysFound += 1
                    if (daysFound > 1) {
                        addTimeSheetColumn(mIncDate, daysIndex)
                        daysIndex += 1;
                    }
                }
            }
        }

        mIncDate.add(1, 'd');

        if (mIncDate.isSame(mThruDate)) {
            break;
        }
    }
    //add handler for keydown
    $("#timeSheetEditorDataEntry td span").keydown(function (e) {
        decimalOnlyHandler(e);
    });

    $("#timeSheetEditorDataEntry td span").not("#timeSheetEditorDataEntryTotalHours td span").keyup(function (e) {
        var colIndex = $(this).attr('data-dayindex');

        var inpTCETotalHours = $('#timeSheetEditorDataEntryTotalHours td span[data-dayindex="' + colIndex + '"]');
        var inpTCERegularHours = $('#timeSheetEditorDataEntryRegularHours td span[data-dayindex="' + colIndex + '"]');
        var inpTCEOvertime1Hours = $('#timeSheetEditorDataEntryOT1Hours td span[data-dayindex="' + colIndex + '"]');
        var inpTCEOvertime2Hours = $('#timeSheetEditorDataEntryOT2Hours td span[data-dayindex="' + colIndex + '"]');
        var inpTCEOvertime3Hours = $('#timeSheetEditorDataEntryOT3Hours td span[data-dayindex="' + colIndex + '"]');
        var inpTCEPersonalHours = $('#timeSheetEditorDataEntryPersonalHours td span[data-dayindex="' + colIndex + '"]');
        var inpTCEHolidayHours = $('#timeSheetEditorDataEntryHolidayHours td span[data-dayindex="' + colIndex + '"]');
        var inpTCEVacationHours = $('#timeSheetEditorDataEntryVacationHours td span[data-dayindex="' + colIndex + '"]');
        var inpTCESickHours = $('#timeSheetEditorDataEntrySickHours td span[data-dayindex="' + colIndex + '"]');

        autoCalcTotalHours(inpTCETotalHours, inpTCERegularHours, inpTCEOvertime1Hours, inpTCEOvertime2Hours, inpTCEOvertime3Hours, inpTCEPersonalHours, inpTCEHolidayHours, inpTCEVacationHours, inpTCESickHours, null);

    });


    return daysIndex;

}

function decimalOnlyHandler(e) {
    // Allow: backspace, delete, tab, escape, enter, ., and :

    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 186, 190]) !== -1 ||
        // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
        // Allow: Ctrl+C
        (e.keyCode == 67 && e.ctrlKey === true) ||
        // Allow: Ctrl+V
        (e.keyCode == 86 && e.ctrlKey === true) ||
        // Allow: Ctrl+X
        (e.keyCode == 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        // let it happen, don't do anything
        return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
}

function addTimeSheetColumn(mIncDate, dayIndex) {

    $('#timeSheetEditorDataEntryHead').append("<td data-dayindex='" + dayIndex + "' data-timecarddate='" + mIncDate.format('MM/DD/YYYY') + "'>" + mIncDate.format('M/D') + "</td>");
    $('#timeSheetEditorDataEntryPunches').append("<td><span style='width: auto;' data-dayindex='" + dayIndex + "'></span><img src='images/exclaim.svg' width='12' height='12' title='' style='margin: 0px; padding: 0px; display: none'></td>");

    $('#timeSheetEditorDataEntryTotalHours').append("<td><span data-dayindex='" + dayIndex + "' contenteditable='true'></span></td>");
    $('#timeSheetEditorDataEntryRegularHours').append("<td><span data-dayindex='" + dayIndex + "' contenteditable='true'></span></td>");
    $('#timeSheetEditorDataEntryOT1Hours').append("<td><span data-dayindex='" + dayIndex + "' contenteditable='true'></span></td>");
    $('#timeSheetEditorDataEntryOT2Hours').append("<td><span data-dayindex='" + dayIndex + "' contenteditable='true'></span></td>");
    $('#timeSheetEditorDataEntryOT3Hours').append("<td><span data-dayindex='" + dayIndex + "' contenteditable='true'></span></td>");
    $('#timeSheetEditorDataEntryVacationHours').append("<td><span data-dayindex='" + dayIndex + "' contenteditable='true'></span></td>");
    $('#timeSheetEditorDataEntryHolidayHours').append("<td><span data-dayindex='" + dayIndex + "' contenteditable='true'></span></td>");
    $('#timeSheetEditorDataEntrySickHours').append("<td><span data-dayindex='" + dayIndex + "' contenteditable='true'></span></td>");
    $('#timeSheetEditorDataEntryPersonalHours').append("<td><span data-dayindex='" + dayIndex + "' contenteditable='true'></span></td>");





}

function convertHHMMToDecimalHours(e) {
    //returns decimal hours if input is valid hh:mm, else returns ''

    if (e.indexOf(":") !== -1) {
        var arr = e.split(':');

        var hours = parseInt(arr[0], 10);
        var minutes = parseInt(arr[1], 10);
        if (isNaN(hours)) {
            hours = 0;
        }
        if (isInteger(hours) == false || isInteger(minutes) == false) {
            return ""
        }

        //alert(hours + ":" + minutes);

        if (hours < 0 || hours > 48) {
            return '';
        }

        if (minutes < 0 || minutes >= 60) {
            return '';
        }

        var decimalHours = parseFloat(hours + parseFloat(minutes / 60));


        return Math.round(decimalHours * 100) / 100;
    }
    else {
        return ''
    }

}

function isInteger(e) {
    if (e === parseInt(e, 10)) {
        return true;
    }
    else {
        return false;
    }
}