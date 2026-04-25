package com.sky.service;

import com.sky.vo.TurnoverReportVO;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface ReportService {

    /**
     * 营业额统计
     * @param start
     * @param end
     * @return
     */
    TurnoverReportVO turnoverStatistics(LocalDate start, LocalDate end);

}
